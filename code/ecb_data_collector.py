#!/usr/bin/env python3
"""
ECB Eurozone Economic Data Collector
Collects economic data from ECB SDMX 2.1 RESTful API
"""

import json
import requests
import pandas as pd
from datetime import datetime
import time
import os
from typing import Dict, List, Optional

class ECBDataCollector:
    def __init__(self):
        self.base_url = "https://data-api.ecb.europa.eu/service/data"
        self.headers = {
            'User-Agent': 'ECB Data Collector/1.0',
            'Accept': 'application/json'
        }
        
        # Define the datasets we want to collect
        self.datasets = {
            'interest_rates': {
                'fm_dataset': {
                    'deposit_facility': 'FM.D.U2.EUR.4F.KR.DFR.LEV',
                    'main_refinancing': 'FM.D.U2.EUR.4F.KR.MRR_FR.LEV',
                    'marginal_lending': 'FM.D.U2.EUR.4F.KR.MLFR.LEV'
                },
                'description': 'ECB Policy Interest Rates',
                'unit': 'Percent per annum'
            },
            'exchange_rates': {
                'eur_usd': 'EXR.M.USD.EUR.SP00.A',
                'description': 'EUR/USD Exchange Rate',
                'unit': 'EUR per USD'
            },
            'inflation': {
                'hicp_general': 'ICP.M.U2.N.000000.4.ANR',
                'description': 'Eurozone HICP Inflation Rate',
                'unit': 'Percentage change (year-on-year)'
            },
            'unemployment': {
                'euro_area_20': 'LFSI.M.I9.S.UNEHRT.TOTAL0.15_74.T',
                'description': 'Euro Area 20 Unemployment Rate',
                'unit': 'Percentage'
            },
            'gdp_growth': {
                'real_gdp_growth': 'MNA.Q.Y.I9.W2.S1.S1.B.B1GQ._Z._Z._Z.EUR.LR.GY',
                'description': 'Euro Area 20 Real GDP Growth',
                'unit': 'Percentage change (quarter-on-quarter)'
            }
        }

    def fetch_data(self, series_code: str, start_period: str = '2020-01', end_period: str = '2025-12') -> Optional[Dict]:
        """
        Fetch data from ECB API for a specific series
        
        Args:
            series_code: SDMX series code
            start_period: Start period in YYYY-MM format
            end_period: End period in YYYY-MM format
            
        Returns:
            Dictionary containing the data or None if error
        """
        try:
            # Construct the API URL
            url = f"{self.base_url}/{series_code}"
            
            # Set parameters
            params = {
                'startPeriod': start_period,
                'endPeriod': end_period,
                'format': 'jsondata',
                'detail': 'full'
            }
            
            print(f"Fetching data for series: {series_code}")
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Successfully fetched data for {series_code}")
                return data
            else:
                print(f"✗ Error fetching data for {series_code}: HTTP {response.status_code}")
                return None
                
        except requests.RequestException as e:
            print(f"✗ Request error for {series_code}: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"✗ JSON decode error for {series_code}: {e}")
            return None
        except Exception as e:
            print(f"✗ Unexpected error for {series_code}: {e}")
            return None

    def process_exchange_rate_data(self, raw_data: Dict) -> List[Dict]:
        """Process EUR/USD exchange rate data"""
        processed_data = []
        
        try:
            # The structure might be different, let's try to extract observations
            if 'dataSets' in raw_data and raw_data['dataSets']:
                dataset = raw_data['dataSets'][0]
                if 'series' in dataset:
                    for series_key, series_data in dataset['series'].items():
                        if 'observations' in series_data:
                            for obs_key, obs_value in series_data['observations'].items():
                                # Extract date from observation key
                                date_parts = obs_key.split(':')
                                if len(date_parts) > 0:
                                    period = date_parts[0]  # Usually the time period
                                    if len(period) == 7:  # YYYY-MM format
                                        processed_data.append({
                                            'date': period,
                                            'value': obs_value[0] if obs_value else None,
                                            'obs_key': obs_key
                                        })
        except Exception as e:
            print(f"Error processing exchange rate data: {e}")
        
        return processed_data

    def process_hicp_data(self, raw_data: Dict) -> List[Dict]:
        """Process HICP inflation data"""
        processed_data = []
        
        try:
            if 'dataSets' in raw_data and raw_data['dataSets']:
                dataset = raw_data['dataSets'][0]
                if 'series' in dataset:
                    for series_key, series_data in dataset['series'].items():
                        if 'observations' in series_data:
                            for obs_key, obs_value in series_data['observations'].items():
                                # Extract date from observation key
                                date_parts = obs_key.split(':')
                                if len(date_parts) > 0:
                                    period = date_parts[0]
                                    if len(period) == 7:  # YYYY-MM format
                                        processed_data.append({
                                            'date': period,
                                            'value': obs_value[0] if obs_value else None,
                                            'obs_key': obs_key
                                        })
        except Exception as e:
            print(f"Error processing HICP data: {e}")
        
        return processed_data

    def process_unemployment_data(self, raw_data: Dict) -> List[Dict]:
        """Process unemployment rate data"""
        processed_data = []
        
        try:
            if 'dataSets' in raw_data and raw_data['dataSets']:
                dataset = raw_data['dataSets'][0]
                if 'series' in dataset:
                    for series_key, series_data in dataset['series'].items():
                        if 'observations' in series_data:
                            for obs_key, obs_value in series_data['observations'].items():
                                # Extract date from observation key
                                date_parts = obs_key.split(':')
                                if len(date_parts) > 0:
                                    period = date_parts[0]
                                    if len(period) == 7:  # YYYY-MM format
                                        processed_data.append({
                                            'date': period,
                                            'value': obs_value[0] if obs_value else None,
                                            'obs_key': obs_key
                                        })
        except Exception as e:
            print(f"Error processing unemployment data: {e}")
        
        return processed_data

    def process_gdp_data(self, raw_data: Dict) -> List[Dict]:
        """Process GDP growth data (quarterly data)"""
        processed_data = []
        
        try:
            if 'dataSets' in raw_data and raw_data['dataSets']:
                dataset = raw_data['dataSets'][0]
                if 'series' in dataset:
                    for series_key, series_data in dataset['series'].items():
                        if 'observations' in series_data:
                            for obs_key, obs_value in series_data['observations'].items():
                                # Extract date from observation key
                                date_parts = obs_key.split(':')
                                if len(date_parts) > 0:
                                    period = date_parts[0]
                                    if len(period) == 7:  # YYYY-Q# format for quarterly
                                        processed_data.append({
                                            'date': period,
                                            'value': obs_value[0] if obs_value else None,
                                            'obs_key': obs_key
                                        })
        except Exception as e:
            print(f"Error processing GDP data: {e}")
        
        return processed_data

    def process_interest_rate_data(self, raw_data: Dict, rate_type: str) -> List[Dict]:
        """Process interest rate data"""
        processed_data = []
        
        try:
            if 'dataSets' in raw_data and raw_data['dataSets']:
                dataset = raw_data['dataSets'][0]
                if 'series' in dataset:
                    for series_key, series_data in dataset['series'].items():
                        if 'observations' in series_data:
                            for obs_key, obs_value in series_data['observations'].items():
                                # Extract date from observation key
                                date_parts = obs_key.split(':')
                                if len(date_parts) > 0:
                                    period = date_parts[0]
                                    if len(period) == 10:  # YYYY-MM-DD format for daily data
                                        # Convert to YYYY-MM format for monthly aggregation
                                        month = period[:7]
                                        processed_data.append({
                                            'date': month,
                                            'daily_date': period,
                                            'value': obs_value[0] if obs_value else None,
                                            'obs_key': obs_key,
                                            'rate_type': rate_type
                                        })
        except Exception as e:
            print(f"Error processing {rate_type} data: {e}")
        
        return processed_data

    def collect_all_data(self) -> Dict:
        """Collect all ECB data"""
        all_data = {
            'collection_timestamp': datetime.now().isoformat(),
            'data_period': '2020-01 to 2025-12',
            'source': 'ECB SDMX 2.1 RESTful API',
            'datasets': {}
        }
        
        print("Starting ECB data collection...")
        
        # Collect interest rates
        print("\n=== Collecting Interest Rates ===")
        interest_rates_data = {}
        for rate_type, series_code in self.datasets['interest_rates']['fm_dataset'].items():
            raw_data = self.fetch_data(series_code)
            if raw_data:
                processed_data = self.process_interest_rate_data(raw_data, rate_type)
                interest_rates_data[rate_type] = {
                    'series_code': series_code,
                    'unit': self.datasets['interest_rates']['unit'],
                    'description': f"ECB {rate_type.replace('_', ' ').title()} Rate",
                    'data': processed_data
                }
            time.sleep(1)  # Rate limiting
        
        all_data['datasets']['interest_rates'] = interest_rates_data
        
        # Collect exchange rates
        print("\n=== Collecting Exchange Rates ===")
        exchange_data = {}
        for currency, series_code in self.datasets['exchange_rates'].items():
            if currency != 'description':
                raw_data = self.fetch_data(series_code)
                if raw_data:
                    processed_data = self.process_exchange_rate_data(raw_data)
                    exchange_data[currency] = {
                        'series_code': series_code,
                        'unit': self.datasets['exchange_rates']['unit'],
                        'description': f"EUR/{currency.upper()} Exchange Rate",
                        'data': processed_data
                    }
                time.sleep(1)
        
        all_data['datasets']['exchange_rates'] = exchange_data
        
        # Collect inflation data
        print("\n=== Collecting Inflation Data ===")
        inflation_data = {}
        for series_name, series_code in self.datasets['inflation'].items():
            if series_name != 'description':
                raw_data = self.fetch_data(series_code)
                if raw_data:
                    processed_data = self.process_hicp_data(raw_data)
                    inflation_data[series_name] = {
                        'series_code': series_code,
                        'unit': self.datasets['inflation']['unit'],
                        'description': self.datasets['inflation']['description'],
                        'data': processed_data
                    }
                time.sleep(1)
        
        all_data['datasets']['inflation'] = inflation_data
        
        # Collect unemployment data
        print("\n=== Collecting Unemployment Data ===")
        unemployment_data = {}
        for series_name, series_code in self.datasets['unemployment'].items():
            if series_name != 'description':
                raw_data = self.fetch_data(series_code)
                if raw_data:
                    processed_data = self.process_unemployment_data(raw_data)
                    unemployment_data[series_name] = {
                        'series_code': series_code,
                        'unit': self.datasets['unemployment']['unit'],
                        'description': self.datasets['unemployment']['description'],
                        'data': processed_data
                    }
                time.sleep(1)
        
        all_data['datasets']['unemployment'] = unemployment_data
        
        # Collect GDP data
        print("\n=== Collecting GDP Data ===")
        gdp_data = {}
        for series_name, series_code in self.datasets['gdp_growth'].items():
            if series_name != 'description':
                raw_data = self.fetch_data(series_code)
                if raw_data:
                    processed_data = self.process_gdp_data(raw_data)
                    gdp_data[series_name] = {
                        'series_code': series_code,
                        'unit': self.datasets['gdp_growth']['unit'],
                        'description': self.datasets['gdp_growth']['description'],
                        'data': processed_data
                    }
                time.sleep(1)
        
        all_data['datasets']['gdp_growth'] = gdp_data
        
        return all_data

    def save_data(self, data: Dict, filename: str):
        """Save collected data to JSON file"""
        try:
            # Ensure the data directory exists
            os.makedirs('data', exist_ok=True)
            
            filepath = os.path.join('data', filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"\n✓ Data successfully saved to {filepath}")
            
            # Print summary
            total_series = 0
            total_observations = 0
            for dataset_name, dataset_info in data['datasets'].items():
                series_count = len(dataset_info)
                obs_count = 0
                for series_data in dataset_info.values():
                    if isinstance(series_data, dict) and 'data' in series_data:
                        obs_count += len(series_data['data'])
                print(f"  {dataset_name}: {series_count} series, {obs_count} observations")
                total_series += series_count
                total_observations += obs_count
            
            print(f"\nTotal: {total_series} series, {total_observations} observations")
            
        except Exception as e:
            print(f"\n✗ Error saving data: {e}")

def main():
    """Main function to run the ECB data collection"""
    collector = ECBDataCollector()
    
    print("ECB Eurozone Economic Data Collector")
    print("=" * 50)
    print("Collecting data from 2020-01 to 2025-12")
    print("Source: ECB SDMX 2.1 RESTful API")
    print("=" * 50)
    
    # Collect all data
    data = collector.collect_all_data()
    
    # Save to file
    collector.save_data(data, 'ecb_eurozone_data.json')
    
    print("\nData collection completed!")

if __name__ == "__main__":
    main()
